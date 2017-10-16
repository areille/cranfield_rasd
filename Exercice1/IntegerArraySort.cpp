#include "IntegerArraySort.h"

void BubbleSort(std::vector<int> &v)
{
    int n = v.size();
    do
    {
        int x = 0;
        for (int i = 1; i < n; i++)
        {
            if (v[i - 1] > v[i])
            {
                int pivot = v[i - 1];
                v[i - 1] = v[i];
                v[i] = pivot;
                x = i;
            }
        }
        n = x;
    } while (n != 0);
}


void Copy(std::vector<int> &v, std::vector<int> &w)
{
    for (int k = 0; k < v.size(); k++)
    {
        w[k] = v[k];
    }
}

void Merge(std::vector<int> &w, int start, int middle, int end, std::vector<int> &v)
{
    int i = start;
    int j = middle;
    for (int k = start; k < end; k++)
    {
        if (i < middle && (j >= end || v[i] <= v[j]))
        {
            w[k] = v[i];
            i++;
        } else {
            w[k] = v[j];
            j++;
        }
    }
}

void SplitAndMerge(std::vector<int> &w, int start, int end, std::vector<int> &v)
{
    if (end - start < 2)
    {
        return;
    }
    int middle = (end + start)/2;

    SplitAndMerge(v, start, middle, w);
    SplitAndMerge(v, middle, end, w);
    Merge(w, start, middle, end, v);

}


void MergeSort(std::vector<int> &v)
{
    int n = v.size();
    std::vector<int> w(n, 0);
    Copy(v, w);
    SplitAndMerge(v, 0, n, w);
}




